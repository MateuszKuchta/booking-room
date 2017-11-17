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

import org.apache.http.HttpStatus;

import com.google.gson.Gson;

import pl.itutil.ecu.service.Event;
import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.PagedResult;
import pl.itutil.ecu.service.Room;
import pl.itutil.ecu.util.ISO8601DateParser;
import pl.itutil.ecu.util.OutlookServiceUtil;

@WebServlet("/freeRooms")
public class FreeRoomsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * <h1>End Point zwracajacy wydarzenie pokoje wolne w tym momencie</h1>
	 * <h2>Method GET</h2>
	 * <h2>{@code example http://localhost:8080/room-reservation/freeRooms}
	 * 
	 * @return Event
	 * @throws ServletException,
	 *             IOException
	 * @since 2017-10-06
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		Gson gson = new Gson();
		HttpSession session = req.getSession();
		Calendar calendar = Calendar.getInstance();

		Date now = new Date();

		calendar.set(Calendar.HOUR_OF_DAY, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		Date d1 = calendar.getTime();

		calendar.set(Calendar.HOUR_OF_DAY, 24);
		Date d2 = calendar.getTime();

		OutlookService outlookService = OutlookServiceUtil.getOutlookService(session);
		if (outlookService != null) {
			String filter = "personType/subclass EQ 'Room'";
			String select = "displayName,userPrincipalName,officeLocation";

			PagedResult<Room> rooms = outlookService.getRooms(select, filter).execute().body();
			Room[] roomsArray = rooms.getValue();
			List<Room> freeRooms = new ArrayList<>(Arrays.asList(roomsArray));

			for (Room room : roomsArray) {
				if (room.getUserPrincipalName().contains("room")) {
					String startString = ISO8601DateParser.toString(d1);
					String endString = ISO8601DateParser.toString(d2);
					PagedResult<Event> events = outlookService
							.getUserEventsInGivenTime(room.getUserPrincipalName(), startString, endString).execute()
							.body();
					if (events != null) {
						for (Event event : events.getValue()) {
							Date start;
							Date end;
							try {
								start = ISO8601DateParser.parse(event.getStart().getDateTime());
								end = ISO8601DateParser.parse(event.getEnd().getDateTime());
								if (now.after(start) && now.before(end)) {
									freeRooms.remove(room);
								}
							} catch (ParseException e) {
								e.printStackTrace();
							}
						}
					}
				} else {
					freeRooms.remove(room);
				}
			}
			resp.getWriter().append(gson.toJson(freeRooms));
		} else {
			resp.getWriter().append("Please sign in to continue.");
			resp.setStatus(HttpStatus.SC_UNAUTHORIZED);
		}

	}

}
