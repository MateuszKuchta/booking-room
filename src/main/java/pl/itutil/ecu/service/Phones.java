package pl.itutil.ecu.service;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Phones {
	@JsonProperty("Phones")
	private List<Phone> phones;

	public List<Phone> getPhones() {
		return phones;
	}

	public void setAttendees(List<Phone> phones) {
		this.phones = phones;
	}
}
