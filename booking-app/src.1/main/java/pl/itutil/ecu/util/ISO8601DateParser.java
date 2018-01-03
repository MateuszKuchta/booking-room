package pl.itutil.ecu.util;
/*
 * Copyright 1999,2004 The Apache Software Foundation.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.TimeZone;

/**
 * ISO 8601 date parsing utility. Designed for parsing the ISO subset used in
 * Dublin Core, RSS 1.0, and Atom.
 * 
 * @author <a href="mailto:burton@apache.org">Kevin A. Burton (burtonator)</a>
 * @version $Id: ISO8601DateParser.java,v 1.2 2005/06/03 20:25:29 snoopdave Exp
 *          $
 */
public class ISO8601DateParser {

	public static Date parse(String input) throws java.text.ParseException {

		SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

		return df.parse(input);

	}

	public static String toString(Date date, String timeZone) {

		SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
		if (timeZone != null) {
			TimeZone tz = TimeZone.getTimeZone(timeZone);
			df.setTimeZone(tz);
		}
		return df.format(date);

	}
	
	public static String toString(Date date) {

		SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

		return df.format(date);

	}
	
	public static String toUTC(String date, String timeZone) {
		
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
		LocalDateTime localDateTime = LocalDateTime.parse(date, formatter);
		ZonedDateTime zonedDateTime = ZonedDateTime.of(localDateTime,ZoneId.of(timeZone));
		LocalDateTime localUTC = zonedDateTime.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
		return localUTC.format(formatter);
	}
	
	

}