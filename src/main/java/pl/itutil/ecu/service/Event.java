package pl.itutil.ecu.service;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Event {
	@JsonProperty("Id")
	private String id;
	@JsonProperty("Subject")
	private String subject;
	@JsonProperty("Organizer")
	private Recipient organizer;
	@JsonProperty("Start")
	private DateTimeTimeZone start;
	@JsonProperty("End")
	private DateTimeTimeZone end;
	@JsonProperty("Location")
	private Location location;
	@JsonProperty("Attendees")
	private List<Recipient> attendees;
	
//	private String reservationTime;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public Recipient getOrganizer() {
		return organizer;
	}

	public void setOrganizer(Recipient organizer) {
		this.organizer = organizer;
	}

	public DateTimeTimeZone getStart() {
		return start;
	}

	public void setStart(DateTimeTimeZone start) {
		this.start = start;
		if (this.end != null) {
//			this.setReservationTime(reservationTime);
		}
	}

	public DateTimeTimeZone getEnd() {
		return end;
	}

	public void setEnd(DateTimeTimeZone end) {
		this.end = end;
		if (this.start != null) {
//			this.setReservationTime(reservationTime);
		}
	}

	public Location getLocation() {
		return location;
	}

	public void setLocation(Location location) {
		this.location = location;
	}

	public List<Recipient> getAttendees() {
		return attendees;
	}

	public void setAttendees(List<Recipient> attendees) {
		this.attendees = attendees;
	}

//	public String getReservationTime() {
//		return reservationTime;
//	}
//
//	@SuppressWarnings("deprecation")
//	public void setReservationTime(String reservationTime) {
//		StringBuilder sb = new StringBuilder();
//		try {
//			Date dateFrom = ISO8601DateParser.parse(start.getDateTime());
//			Date dateTo = ISO8601DateParser.parse(end.getDateTime());
//			sb.append(dateFrom.getHours() < 10 ? "0" + (dateFrom.getHours()) : (dateFrom.getHours())).append(":")
//					.append(dateFrom.getMinutes() < 10 ? "0" + dateFrom.getMinutes() : dateFrom.getMinutes())
//					.append(" - ").append(dateTo.getHours() < 10 ? "0" + (dateTo.getHours()) : (dateTo.getHours()))
//					.append(":").append(dateTo.getMinutes() < 10 ? "0" + dateTo.getMinutes() : dateTo.getMinutes());
//		} catch (ParseException e) {
//			e.printStackTrace();
//		}
//
//		this.reservationTime = sb.toString();
//	}

}
