package pl.itutil.ecu.util;

import javax.servlet.http.HttpServletRequest;

public class Utils {

	public static String getBaseUrl(HttpServletRequest request) {
		String scheme = "https://";
		String serverName = request.getServerName();
		String serverPort = (request.getServerPort() == 80) ? "" : ":" + request.getServerPort();
		String contextPath = request.getContextPath();
		return scheme + serverName + serverPort + contextPath;
	}

	public static String getOutlookTimeZone(String timeZone) {
		StringBuilder outLookTimeZone = new StringBuilder();
		timeZone = translateCET(timeZone);
		outLookTimeZone.append("outlook.timezone=\"").append(timeZone).append("\"");
		return outLookTimeZone.toString();
	}

	public static String translateCET(String string) {
		if(string.equals("CET")) {
			string = "Europe/Warsaw";
		}
		return string;
	}

}
