package pl.itutil.ecu.web.servlets;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;

import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.PagedResult;
import pl.itutil.ecu.service.Room;
import pl.itutil.ecu.util.OutlookServiceUtil;
import retrofit2.Response;

/**
 * Servlet implementation class RoomsServlet
 */
@WebServlet("/rooms")
public class RoomsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * <h1>End Point zwracajacy uzytkownikow "nie pracownikow" organizacji</h1>
	 * <h2>Method GET</h2>
	 * <h2>{@code example http://localhost:8080/ecu-web/rooms}
	 * 
	 * @return List<Object>
	 * @throws ServletException,
	 *             IOException
	 * @since 2017-10-06
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		Gson gson = new Gson();
		HttpSession session = req.getSession();

		OutlookService outlookService = OutlookServiceUtil.getOutlookService(session);
		if (outlookService != null) {
			String filter = "personType/subclass EQ 'Room'";
			String select = "displayName,userPrincipalName,officeLocation";

			PagedResult<Room> rooms = outlookService.getRooms(null, filter).execute().body();
			Response<PagedResult<Room>> execute = outlookService.getRooms(null, filter).execute();
			resp.getWriter().append(gson.toJson(rooms));
		} else {
			resp.getWriter().append("Please sign in to continue.");
		}
	}

}
