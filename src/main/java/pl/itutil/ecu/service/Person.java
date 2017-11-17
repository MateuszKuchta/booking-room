package pl.itutil.ecu.service;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Person {
	private String id;
	private EmailAddress emailAddresses;
	private String displayName;
	private List<Phone> phones;

	public Person() {
		this.phones = new ArrayList<Phone>();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public EmailAddress getEmailAddresses() {
		return emailAddresses;
	}

	public void setEmailAddresses(EmailAddress emailAddresses) {
		this.emailAddresses = emailAddresses;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public List<Phone> getPhones() {
		return phones;
	}

	public void setPhones(List<Phone> phones) {
		this.phones = phones;
	}

}