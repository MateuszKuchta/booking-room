package pl.itutil.ecu.web.servlets;

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

import pl.itutil.ecu.service.Event;
import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.PagedResult;
import pl.itutil.ecu.util.ISO8601DateParser;
import pl.itutil.ecu.util.OutlookServiceUtil;

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
		String prefer = (String) session.getAttribute("prefer");
		Calendar calendar = Calendar.getInstance();
		String userEmail = req.getParameter("userEmail");
		Date now = new Date();
		OutlookService outlookService = OutlookServiceUtil.getOutlookService(session);
		if (outlookService != null) {
			calendar.set(Calendar.HOUR_OF_DAY, 0);
			calendar.set(Calendar.MINUTE, 0);
			calendar.set(Calendar.SECOND, 0);
			Date d1 = calendar.getTime(); // the midnight, that's the first second
											// of the day.
			calendar.set(Calendar.HOUR_OF_DAY, 24);
			Date d2 = calendar.getTime();

			String startDateTime = ISO8601DateParser.toString(d1);
			String endDateTime = ISO8601DateParser.toString(d2);

			PagedResult<Event> events = outlookService.getUserEventsInGivenTime(prefer, userEmail, startDateTime, endDateTime)
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
		} else {
			resp.getWriter().append("Please sign in to continue.");
		}
	}

}
