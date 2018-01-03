package pl.itutil.ecu.web.servlets;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.time.DateUtils;
import org.apache.http.HttpStatus;

import pl.itutil.ecu.service.DateTimeTimeZone;
import pl.itutil.ecu.service.Event;
import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.PagedResult;
import pl.itutil.ecu.util.ISO8601DateParser;
import pl.itutil.ecu.util.OutlookServiceUtil;
import retrofit2.Response;

/**
 * <h1>End Point zakanczajacy biezace wydarzenie</h1>
 * <h2>Method GET</h2>
 * <h2>{@code example http://localhost:8080/ecu-web/endCurrentEvent?roomEmail=ecroom1@itutil.com}</h2>
 * 
 * @throws ServletException,
 *             IOException
 * @since 2017-11-09
 */
@WebServlet("/endCurrentEvent")
public class EndEventServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		HttpSession session = req.getSession();
		String prefer = (String) session.getAttribute("prefer");
		String userEmail = req.getParameter("roomEmail");
		OutlookService outlookService = OutlookServiceUtil.getOutlookService(session);
		if (outlookService != null) {
			Date now = new Date();
			String startDateTime = ISO8601DateParser.toString(now);
			String endDateTime = ISO8601DateParser.toString(DateUtils.addHours(now, 24));
			Response<PagedResult<Event>> pagedResultEevents = outlookService
					.getUserEventsInGivenTime(prefer, userEmail, startDateTime, endDateTime).execute();
			PagedResult<Event> events = pagedResultEevents.body();
			if (events.getValue().length != 0) {
				
				Event[] eventsValues = events.getValue();
				String eventId = eventsValues[0].getId();
				Event event = eventsValues[0];
				
				DateTimeTimeZone end = event.getEnd();
				ZonedDateTime zonedDateTime = ZonedDateTime.now(ZoneId.of(end.getTimeZone()));
				LocalDateTime newDate = zonedDateTime.toLocalDateTime();

				Event justEndTimeEvent = new Event();
				end.setDateTime(newDate.toString());
				justEndTimeEvent.setEnd(end);
				Response<Object> execute = outlookService.endEvent(userEmail, eventId, justEndTimeEvent).execute();
				while (execute.code() == 500) {
					execute = outlookService.endEvent(userEmail, eventId, justEndTimeEvent).execute();
				}

				resp.setStatus(HttpStatus.SC_NO_CONTENT);
				resp.getWriter().append("Event has been ended");
			} else {
				resp.getWriter().append("No events found");
				resp.setStatus(HttpStatus.SC_NOT_FOUND);
			}
		} else {
			resp.getWriter().append("Please sign in to continue.");
			resp.setStatus(HttpStatus.SC_UNAUTHORIZED);
		}

	}
}
