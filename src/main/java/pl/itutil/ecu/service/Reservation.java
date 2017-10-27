package pl.itutil.ecu.service;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Reservation {
	@JsonProperty("Subject")
	private String subject;
	@JsonProperty("Start")
	private Date start;
	@JsonProperty("End")
	private Date end;
	@JsonProperty("Room")
	private Location room;

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public Date getStart() {
		return start;
	}

	public void setStart(Date start) {
		this.start = start;
	}

	public Date getEnd() {
		return end;
	}

	public void setEnd(Date end) {
		this.end = end;
	}

	public Location getRoom() {
		return room;
	}

	public void setRoom(Location room) {
		this.room = room;
	}

}
