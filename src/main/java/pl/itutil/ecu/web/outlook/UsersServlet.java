package pl.itutil.ecu.web.outlook;

import java.io.IOException;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;

import com.google.gson.Gson;

import pl.itutil.ecu.auth.TokenResponse;
import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.OutlookServiceBuilder;
import pl.itutil.ecu.service.PagedResult;

@WebServlet("/users")
public class UsersServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * <h1>End Point zwracajacy uzytkownikow organizacji</h1>
	 * <h2>Method GET</h2>
	 * <h2>{@code example http://localhost:8080/ecu-web/users}
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

		OutlookService outlookService = OutlookServiceBuilder.getOutlookService(tokens.getAccessToken(), email);

		String filter = "personType/subclass EQ 'OrganizationUser'";

		PagedResult<Object> users = outlookService.getUsers(filter).execute().body();

		resp.getWriter().append(gson.toJson(users));
	}

}
