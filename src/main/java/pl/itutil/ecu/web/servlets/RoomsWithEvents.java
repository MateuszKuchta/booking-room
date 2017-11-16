package pl.itutil.ecu.web.servlets;

import java.io.IOException;
import java.util.ArrayList;
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

import com.google.gson.Gson;
import com.google.gson.JsonElement;

import pl.itutil.ecu.service.Event;
import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.PagedResult;
import pl.itutil.ecu.service.Recipient;
import pl.itutil.ecu.service.Room;
import pl.itutil.ecu.util.ISO8601DateParser;
import pl.itutil.ecu.util.OutlookServiceUtil;
import retrofit2.Response;

/**
 * Servlet implementation class RoomWithEvents
 */
@WebServlet("/getRoomsWithEvents")
public class RoomsWithEvents extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * <h1>End Point zwracajacy wszystkie pokoje wraz z wydarzeniami w ciagu
	 * 24h</h1>
	 * <h2>Method GET</h2>
	 * <h2>{@code example http://localhost:8080/ecu-web/getRoomsWithEvents}
	 * 
	 * @return List<Events>
	 * @throws ServletException,
	 *             IOException
	 * @since 2017-11-09
	 */
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		/// api/v1.0/users/{userEmail}/calendarview?startdatetime={startDateTime}&enddatetime={endDateTime}
		List<JsonElement> resultList = new ArrayList<>();
		Gson gson = new Gson();
		String startDateTime, endDateTime;
		HttpSession session = req.getSession();
		OutlookService outlookService = OutlookServiceUtil.getOutlookService(session);

		if (outlookService != null) {
			String select = "displayName,userPrincipalName,officeLocation";
			String filter = "personType/subclass EQ 'Room'";
			Response<PagedResult<Room>> rooms = outlookService.getRooms(select, filter).execute();
			Room[] value = rooms.body().getValue();

			Date now = new Date();
			startDateTime = ISO8601DateParser.toString(DateUtils.addHours(now, -1));
			endDateTime = ISO8601DateParser.toString(DateUtils.addHours(now, 24));

			for (Room room : value) {
				String userEmail = room.getUserPrincipalName();
				PagedResult<Event> events = outlookService
						.getUserEventsInGivenTime(userEmail, startDateTime, endDateTime).execute().body();
				if (events != null) {
					for (Event event : events.getValue()) {
						event.filterRoomsFromAttendees();
						for (Recipient recipient : event.getAttendees()) {
							recipient.setPhone(outlookService);
						}
					}
					JsonElement jsonElement = gson.toJsonTree(events);
					jsonElement.getAsJsonObject().addProperty("emailAddress", userEmail);
					resultList.add(jsonElement);
				} else {
					events = new PagedResult<>();
					JsonElement jsonElement = gson.toJsonTree(events);
					jsonElement.getAsJsonObject().addProperty("emailAddress", userEmail);
					resultList.add(jsonElement);
				}
			}
			resp.getWriter().append(gson.toJson(resultList));
		} else {
			resp.getWriter().append("Please sign in to continue.");
			resp.setStatus(HttpStatus.SC_UNAUTHORIZED);
		}

	}

}
