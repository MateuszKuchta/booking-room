package pl.itutil.ecu.web.servlets;

import java.io.IOException;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import pl.itutil.ecu.auth.AuthHelper;
import pl.itutil.ecu.util.Utils;

/**
 * Servlet implementation class OutlookServlet
 */
@WebServlet("/login")
public class LoginServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		UUID state = UUID.randomUUID();
		UUID nonce = UUID.randomUUID();
		String prefer = (String) req.getParameter("prefer");

		// Save the state and nonce in the session so we can
		// verify after the auth process redirects back
		HttpSession session = req.getSession();
		session.setAttribute("expected_state", state);
		session.setAttribute("expected_nonce", nonce);
		session.setAttribute("prefer", Utils.getOutlookTimeZone(prefer));

		String loginUrl = AuthHelper.getLoginUrl(state, nonce);
		resp.sendRedirect(resp.encodeRedirectURL(loginUrl));
	}

}
