package pl.itutil.ecu.service;

import java.util.Iterator;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Event {
	private String id;
	private String subject;
	private Recipient organizer;
	private DateTimeTimeZone start;
	private DateTimeTimeZone end;
	private Location location;
	private List<Recipient> attendees;

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
	}

	public DateTimeTimeZone getEnd() {
		return end;
	}

	public void setEnd(DateTimeTimeZone end) {
		this.end = end;
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

	public void filterRoomsFromAttendees() {
		for (Iterator<Recipient> recipient = attendees.iterator(); recipient.hasNext();) {
			if (recipient.next().getEmailAddress().getName().contains("Room")) {
				recipient.remove();
			}
		}
	}
}
