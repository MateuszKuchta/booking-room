package pl.itutil.ecu.service;

import java.util.Iterator;
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
		for (Iterator<Recipient> it = attendees.iterator(); it.hasNext();) {
			if(it.next().getEmailAddress().getName().contains("Room")){
				it.remove();
			}
		}
	}
}
