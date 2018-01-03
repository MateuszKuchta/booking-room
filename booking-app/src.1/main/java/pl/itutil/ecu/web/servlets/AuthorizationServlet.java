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
import pl.itutil.ecu.auth.IdToken;
import pl.itutil.ecu.auth.TokenResponse;
import pl.itutil.ecu.util.Utils;

/**
 * Servlet implementation class OutlookAuthorizationServlet
 */
@WebServlet("/authorize")
public class AuthorizationServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// Get the expected state value from the session
		HttpSession session = req.getSession();
		UUID expectedState = (UUID) session.getAttribute("expected_state");
		UUID expectedNonce = (UUID) session.getAttribute("expected_nonce");
		session.removeAttribute("expected_state");
		session.removeAttribute("expected_nonce");
		String code = req.getParameter("code");
		String idToken = req.getParameter("id_token");
		UUID state = UUID.fromString(req.getParameter("state"));

		// Make sure that the state query parameter returned matches
		// the expected state
		if (state.equals(expectedState)) {
			IdToken idTokenObj = IdToken.parseEncodedToken(idToken, expectedNonce.toString());
			if (idTokenObj != null) {
				TokenResponse tokenResponse = AuthHelper.getTokenFromAuthCode(code, idTokenObj.getTenantId());
				session.setAttribute("tokens", tokenResponse);
				session.setAttribute("userConnected", true);
				session.setAttribute("userName", idTokenObj.getName());
				session.setAttribute("userTenantId", idTokenObj.getTenantId());
				resp.sendRedirect(resp.encodeRedirectURL(Utils.getBaseUrl(req) + "/mainplatform/#/roomDetails"));
			} else {
				session.setAttribute("error", "ID token failed validation.");
			}
		} else {
			session.setAttribute("error", "Unexpected state returned from authority.");
		}

	}

}
