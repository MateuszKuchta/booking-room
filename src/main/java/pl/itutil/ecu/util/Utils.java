package pl.itutil.ecu.util;

import javax.servlet.http.HttpServletRequest;

public class Utils {

	public static String getBaseUrl(HttpServletRequest request) {
		String scheme = request.getScheme() + "://";
		String serverName = request.getServerName();
		String serverPort = (request.getServerPort() == 80) ? "" : ":" + request.getServerPort();
		String contextPath = request.getContextPath();
		return scheme + serverName + serverPort + contextPath;
	}

	public static String getOutlookTimeZone(String timeZone) {
		StringBuilder outLookTimeZone = new StringBuilder();
		outLookTimeZone.append("outlook.timezone=\"").append(timeZone).append("\"");
		return outLookTimeZone.toString();
	}

}
