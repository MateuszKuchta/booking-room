package pl.itutil.ecu.web.servlets;

import java.io.IOException;
import java.util.Date;

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
import pl.itutil.ecu.service.Recipient;
import pl.itutil.ecu.util.ISO8601DateParser;
import pl.itutil.ecu.util.OutlookServiceUtil;
import pl.itutil.ecu.util.Utils;
import retrofit2.Response;

@WebServlet("/getUserEvents")
public class UserEventsServlet extends HttpServlet {
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
		String prefer = (String) session.getAttribute("prefer");
		
		OutlookService outlookService = OutlookServiceUtil.getOutlookService(session);

		if (outlookService != null) {
			Date now = new Date();
			startDateTime = ISO8601DateParser.toString(DateUtils.addHours(now, 0));
			endDateTime = ISO8601DateParser.toString(DateUtils.addHours(now, 24));

			Response<PagedResult<Event>> execute = outlookService
					.getUserEventsInGivenTime(prefer, userEmail, startDateTime, endDateTime).execute();
			PagedResult<Event> events = execute.body();
			gson = new Gson();
			if (events != null) {
				for (Event event : events.getValue()) {
					event.filterRoomsFromAttendees();
					for (Recipient recipient : event.getAttendees()) {
						recipient.setPhone(outlookService);
					}
				}
				resp.setContentType(ContentType.APPLICATION_JSON.toString());
				resp.setStatus(HttpStatus.SC_ACCEPTED);
				resp.getWriter().append(gson.toJson(events));
			} else {
				resp.getWriter().append("No events found");
				resp.setContentType(ContentType.APPLICATION_JSON.toString());
				resp.setStatus(HttpStatus.SC_NOT_FOUND);

			}
		} else {
			resp.getWriter().append("Please sign in to continue.");
			resp.setStatus(HttpStatus.SC_UNAUTHORIZED);
		}

	}

}
