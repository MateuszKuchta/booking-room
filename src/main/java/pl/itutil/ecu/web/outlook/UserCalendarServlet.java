package pl.itutil.ecu.web.outlook;

import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.time.DateUtils;
import org.apache.http.HttpStatus;
import org.apache.http.entity.ContentType;

import com.google.gson.Gson;

import pl.itutil.ecu.auth.TokenResponse;
import pl.itutil.ecu.service.DateTimeTimeZone;
import pl.itutil.ecu.service.Event;
import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.OutlookServiceBuilder;
import pl.itutil.ecu.service.PagedResult;
import pl.itutil.ecu.util.ISO8601DateParser;

@WebServlet("/getUserEvents")
public class UserCalendarServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * <h1>End Point zwracajacy wydarzenia uzytkownika w podanym zakresie czasu</h1>
	 * <h2>Method GET</h2>
	 * <h2>{@code example http://localhost:8080/ecu-web/getUserEvents?userEmail=ecroom1@itutil.com}
	 * 
	 * @return List<Events>
	 * @throws ServletException,
	 *             IOException
	 * @since 2017-10-03
	 */
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		/// api/v1.0/users/{userEmail}/calendarview?startdatetime={startDateTime}&enddatetime={endDateTime}
		String userEmail = req.getParameter("userEmail");
		String startDateTime, endDateTime;
		Gson gson;
		HttpSession session = req.getSession();
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

		String email = (String) session.getAttribute("userEmail");
		
		startDateTime = ISO8601DateParser.toString(DateUtils.addHours(now, -2));
		endDateTime = ISO8601DateParser.toString(DateUtils.addHours(now, 24));

		PagedResult<Event> events = new PagedResult<Event>();

		OutlookService outlookService = OutlookServiceBuilder.getOutlookService(tokens.getAccessToken(), email);
		events = outlookService.getUserEventsInGivenTime(userEmail, startDateTime, endDateTime).execute().body();
		List<Event> eventList = new ArrayList<>(Arrays.asList(events.getValue()));
		gson = new Gson();
		if (events.getValue().length != 0) {
			for (Event event : eventList) {

				// poprawka dla tabletu SONY
//				try {
//					DateTimeTimeZone eventStart = event.getStart();
//					DateTimeTimeZone eventEnd = event.getEnd();
//
//					Date eventStartDateTime = ISO8601DateParser.parse(eventStart.getDateTime());
//					Date eventEndDateTime = ISO8601DateParser.parse(eventEnd.getDateTime());
//
//					eventStartDateTime = DateUtils.addHours(eventStartDateTime, -2);
//					eventEndDateTime = DateUtils.addHours(eventEndDateTime, -2);
//
//					eventStart.setDateTime(ISO8601DateParser.toString(eventStartDateTime));
//					eventEnd.setDateTime(ISO8601DateParser.toString(eventEndDateTime));
//
//					event.setStart(eventStart);
//					event.setEnd(eventEnd);
//				} catch (ParseException e) {
//					e.printStackTrace();
//				}

			}
			resp.setContentType(ContentType.APPLICATION_JSON.toString());
			resp.setStatus(HttpStatus.SC_ACCEPTED);
			resp.getWriter().append(gson.toJson(events));
		} else {
			resp.getWriter().append(gson.toJson(events));
			resp.setContentType(ContentType.APPLICATION_JSON.toString());
			resp.setStatus(HttpStatus.SC_NOT_FOUND);
		}

	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
