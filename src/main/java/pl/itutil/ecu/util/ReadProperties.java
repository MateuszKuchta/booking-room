package pl.itutil.ecu.util;

import java.io.IOException;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ReadProperties {

	private static final Logger LOGGER = LoggerFactory.getLogger(ReadProperties.class);

	private static ReadProperties instance = null;

	private Properties props = null;

	private ReadProperties() {
		props = new Properties();
		try {
			props.load(getClass().getResourceAsStream("/config.properties"));
		} catch (IOException e) {
			LOGGER.error(e.getMessage());
		}
	}

	public static synchronized ReadProperties getInstance() {
		if (instance == null)
			instance = new ReadProperties();
		return instance;
	}

	public String getValue(String propKey) {
		return this.props.getProperty(propKey);
	}
}
