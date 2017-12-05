package pl.itutil.ecu.web.servlets;

import java.io.BufferedReader;
import java.io.IOException;
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

import org.apache.commons.lang3.time.DateUtils;
import org.apache.http.HttpStatus;
import org.apache.http.entity.ContentType;

import com.google.gson.Gson;

import pl.itutil.ecu.service.Event;
import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.PagedResult;
import pl.itutil.ecu.util.ISO8601DateParser;
import pl.itutil.ecu.util.OutlookServiceUtil;
import retrofit2.Response;

@WebServlet("/event")
public class EventServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * <h1>End Point rezerwuje pokoj wedlug podanego jsona w "body"</h1>
	 * <h2>Method POST</h2>
	 * 
	 * <pre>
	 * <h2>{@code example http://localhost:8080/ecu-web/event
	 * {
	 * 
	 *   "subject": "test1 event", // Tytul
	 *   "start": {
	 *     "dateTime": "2017-10-06T11:40:29.255Z",
	 *     "timeZone": "Europe/Warsaw"
	 *   },
	 *   "end": {
	 *     "dateTime": "2017-10-06T13:40:29.255Z",
	 *     "timeZone": "Europe/Warsaw"
	 *   },
	 *   "location": { // Lokacja
	 *                 "displayName": "ecroom1@itutil.com",
	 *                 "locationType":"ConferenceRoom" // pole wymagane dla poprawnego działania 
	 *             },
	 *             
	 *     "attendees": [ // uczestnicy
	 *     {
	 *       "emailAddress": {
	 *         "address":"marcin.stanowski@itutil.com",
	 *         "name": "Marcin Stanowski"
	 *       },
	 *       "type": "optional"  // wymagany czy opcjonalny
	 *     },
	 *     {
	 *       "emailAddress": {
	 *         "address":"mateusz.kuchta@itutil.com",
	 *         "name": "Mateusz Kuchta"
	 *       },
	 *       "type": "optional"
	 *     },
	 *     {
	 *       "emailAddress": {
	 *         "address":"ecroom1@itutil.com",
	 *         "name": "ecu room 1"
	 *       },
	 *       "type": "required"
	 *     }
	 *   ]
	 * }
	 * }
	 * </pre>
	 * 
	 * @return Event
	 * @throws ServletException,
	 *             IOException
	 * @since 2017-10-03
	 */
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		Gson gson = new Gson();
		HttpSession session = req.getSession();
		String prefer = (String) session.getAttribute("prefer");

		OutlookService outlookService = OutlookServiceUtil.getOutlookService(session);
		if (outlookService != null) {
			StringBuilder sb = new StringBuilder();
			BufferedReader reader = req.getReader();
			try {
				String line;
				while ((line = reader.readLine()) != null) {
					sb.append(line).append('\n');
				}
			} finally {
				reader.close();
			}

			Event event = new Event();
			event = gson.fromJson(sb.toString(), Event.class);
			
			event.translateCET();
			String userEmail = event.getLocation().getDisplayName();
			
//			Date startDateTime = new Date();
//			Date endDateTime = DateUtils.addHours(new Date(), 1);
			
			String start = event.getStart().getDateTime();
			String end = event.getEnd().getDateTime();
			
			String timeZone = event.getStart().getTimeZone();
//			start = ISO8601DateParser.toUTC(start, timeZone);
//			end = ISO8601DateParser.toUTC(end, timeZone);
			
			Response<PagedResult<Event>> execute = outlookService.getUserEventsInGivenTime(prefer, userEmail, start, end).execute();
			PagedResult<Event> userEvents = execute.body();
			if (userEvents != null) {
				if (userEvents.getValue().length == 0) {
				Response<Object> responseEvent = outlookService.makeEvent(userEmail, event).execute();

				resp.setContentType(ContentType.APPLICATION_JSON.toString());
				resp.setStatus(HttpStatus.SC_CREATED);
				resp.getWriter().append(gson.toJson(responseEvent));
			} else {
				resp.setStatus(HttpStatus.SC_CONFLICT);
				resp.getWriter().append("There is an event in given time already.");
			} 
			} else {
				resp.getWriter().append(execute.errorBody().string());
			}
		} else {
			resp.getWriter().append("Please sign in to continue.");
			resp.setStatus(HttpStatus.SC_UNAUTHORIZED);
		}
	}

	/**
	 * <h1>End Point zwracajacy wydarzenie po emailu salki i id wydarzenia</h1>
	 * <h2>Method GET</h2>
	 * <h2>{@code example http://localhost:8080/ecu-web/event?userEmail=ecroom1@itutil.com&eventId=AQMkADBhYjJiM2M4LTg3NmQtNGUxNi04OWM1LTE1ZGZlOWExNGZkZAAARgAAA9-BtFCHaodEpK7Kfp8lb0kHAMtkDx2QmiRFl-i9L1e97QUAAAIBDQAAAMtkDx2QmiRFl-i9L1e97QUAAAINrQAAAA==}
	 * 
	 * @return Event
	 * @throws ServletException,
	 *             IOException
	 * @since 2017-10-05
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		Gson gson = new Gson();
		HttpSession session = req.getSession();
		Calendar calendar = Calendar.getInstance();
		String prefer = (String) session.getAttribute("prefer");
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

			String eventId = req.getParameter("eventId");
			String userEmail = req.getParameter("userEmail");
			
			PagedResult<Event> events = outlookService.getUserEventsInGivenTime(prefer, userEmail, startDateTime, endDateTime)
					.execute().body();

			List<Event> eventList = new ArrayList<>(Arrays.asList(events.getValue()));
			boolean notFound = true;
			for (Event event : eventList) {
				if (event.getId().equals(eventId)) {
					resp.getWriter().append(gson.toJson(event));
					resp.setContentType(ContentType.APPLICATION_JSON.toString());
					resp.setStatus(HttpStatus.SC_OK);
					notFound = false;
				}
			}
			if (notFound) {
				resp.getWriter().append("Event not found");
				resp.setContentType(ContentType.APPLICATION_JSON.toString());
				resp.setStatus(HttpStatus.SC_NOT_FOUND);
			}
		} else {
			resp.getWriter().append("Please sign in to continue.");
			resp.setStatus(HttpStatus.SC_UNAUTHORIZED);
		}
	}

}
