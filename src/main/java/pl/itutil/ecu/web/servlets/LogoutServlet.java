package pl.itutil.ecu.web.servlets;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.http.HttpStatus;

import pl.itutil.ecu.util.Utils;

/**
 * <h1>Endpoint usuwajacy z sesje tokeny co powoduje brak dostepu do zasobow(wylogowywujacy)</h1>
 * <h2>Method GET</h2>
 * <h2>{@code example http://localhost:8080/room-reservation/logout}
 * 
 * @throws ServletException,
 *             IOException
 * @since 2017-12-04
 */
@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.getSession().removeAttribute("tokens");
		//resp.sendRedirect(resp.encodeRedirectURL(Utils.getBaseUrl(req) + "/mainplatform/#/roomDetails"));
		resp.setStatus(HttpStatus.SC_ACCEPTED);
	}
       
	
}
