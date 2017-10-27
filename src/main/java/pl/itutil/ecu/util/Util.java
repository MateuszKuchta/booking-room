package pl.itutil.ecu.util;

import java.io.IOException;
import java.util.Map;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sap.core.connectivity.api.configuration.ConnectivityConfiguration;
import com.sap.core.connectivity.api.configuration.DestinationConfiguration;

public class Util {
	private static final Logger LOGGER = LoggerFactory.getLogger(Util.class);

	private static final String JNDI_KEY_CONNECTIVITY_CONFIG = "java:comp/env/ConnectivityConfiguration";

	private static final String DESTINATION_OAUTHAS_TOKEN = ReadProperties.getInstance()
			.getValue("OAuthDestinationName");

	public static Map<String, String> getOAuthDetails() {
		String accessToken = null;

		Context ctx;
		try {
			ctx = new InitialContext();
			ConnectivityConfiguration configuration = (ConnectivityConfiguration) ctx
					.lookup(JNDI_KEY_CONNECTIVITY_CONFIG);

			// get destination configuration for "oauthasTokenEndpoint"
			DestinationConfiguration destConfiguration = configuration.getConfiguration(DESTINATION_OAUTHAS_TOKEN);

			// get all destination properties
			Map<String, String> allDestinationPropeties = destConfiguration.getAllProperties();
			return allDestinationPropeties;
		} catch (NamingException e) {
			LOGGER.error("OAuth Destination Name Error");
			return null;
		}
	}

	public static void exceptionResponseHandler(String errorMessage, int responseStatus, Throwable e,
			HttpServletResponse response) throws IOException {

		LOGGER.debug(errorMessage);
		e.printStackTrace();
		LOGGER.debug(e.getMessage());
		response.setStatus(responseStatus);
		response.getWriter().append(errorMessage);
	}

}
