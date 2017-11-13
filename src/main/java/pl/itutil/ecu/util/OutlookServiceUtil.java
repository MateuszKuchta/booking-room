package pl.itutil.ecu.util;

import java.util.Date;

import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.time.DateUtils;

import pl.itutil.ecu.auth.AuthHelper;
import pl.itutil.ecu.auth.TokenResponse;
import pl.itutil.ecu.service.OutlookService;
import pl.itutil.ecu.service.OutlookServiceBuilder;

public class OutlookServiceUtil {

	public static OutlookService getOutlookService(HttpSession session) {
		TokenResponse tokens = (TokenResponse) session.getAttribute("tokens");
		OutlookService outlookService;
		String tenantId = (String) session.getAttribute("userTenantId");
		if (tokens == null) {
			return null;
		}
		
		Date now = new Date();
		if (now.after(tokens.getExpirationTime())) {
			tokens = AuthHelper.ensureTokens(tokens, tenantId);
			session.removeAttribute("tokens");
			session.setAttribute("tokens", tokens);
		}

		String email = (String) session.getAttribute("userEmail");

		outlookService = OutlookServiceBuilder.getOutlookService(tokens.getAccessToken(), email);
		return outlookService;
	}
}