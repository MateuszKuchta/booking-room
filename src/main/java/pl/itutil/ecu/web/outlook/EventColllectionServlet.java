package pl.itutil.ecu.web.outlook;

import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;

import pl.itutil.ecu.auth.TokenResponse;
import pl.itutil.ecu.service.Event;
import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.OutlookServiceBuilder;
import pl.itutil.ecu.service.PagedResult;
import pl.itutil.ecu.util.ISO8601DateParser;

@WebServlet("/eventCollection")
public class EventColllectionServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * <h1>End Point zwracajacy dla podanego userEmail terazniejsza lub przyszle
	 * wydarzenia z tego dnia</h1>
	 * <h2>Method GET</h2>
	 * <h2>{@code example http://localhost:8080/ecu-web/eventCollection?userEmail=ecroom1@itutil.com}
	 * 
	 * @return List<Event>
	 * @throws ServletException,
	 *             IOException
	 * @since 2017-10-05
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		Gson gson = new Gson();
		HttpSession session = req.getSession();
		Calendar calendar = Calendar.getInstance();
		String userEmail = req.getParameter("userEmail");

		TokenResponse tokens = (TokenResponse) session.getAttribute("tokens");
		if (tokens == null) {
			// No tokens in session, user needs to sign in
			resp.getWriter().append("Please sign in to continue.");
		}
		Date now = new Date();
		if (now.after(tokens.getExpirationTime())) {
			// Token expired
			// TODO: Use the refresh token to request a new token from the token
			// endpoint
			// For now, just complain

			resp.getWriter().append("The access token has expired. Please logout and re-login.");
		}
		calendar.set(Calendar.HOUR_OF_DAY, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		Date d1 = calendar.getTime(); // the midnight, that's the first second
										// of the day.
		calendar.set(Calendar.HOUR_OF_DAY, 24);
		Date d2 = calendar.getTime();

		String startDateTime = ISO8601DateParser.toString(d1);
		String endDateTime = ISO8601DateParser.toString(d2);
		String email = (String) session.getAttribute("userEmail");

		OutlookService outlookService = OutlookServiceBuilder.getOutlookService(tokens.getAccessToken(), email);
		PagedResult<Event> events = outlookService.getUserEventsInGivenTime(userEmail, startDateTime, endDateTime)
				.execute().body();
		List<Event> resultList = new ArrayList<>();
		Event[] eventArray = events.getValue();
		List<Event> eventList = new ArrayList<>(Arrays.asList(eventArray));
		for (Event event : eventList) {
			try {
				Date endDate = ISO8601DateParser.parse(event.getEnd().getDateTime());
				if (!endDate.before(now)) {
					resultList.add(event);
				}
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}

		resp.getWriter().append(gson.toJson(resultList));
	}

}
