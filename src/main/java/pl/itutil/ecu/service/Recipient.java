package pl.itutil.ecu.service;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Recipient {
	private EmailAddress emailAddress;
	private String type;
	private Phone phone;

	public EmailAddress getEmailAddress() {
		return emailAddress;
	}

	public void setEmailAddress(EmailAddress emailAddress) {
		this.emailAddress = emailAddress;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Phone getPhone() {
		return phone;
	}

	public void setPhone(Phone phone) {
		this.phone = phone;
	}

	public void setPhone(OutlookService outlookService) throws IOException {
		String filter;
		String select;
		String preferedPhoneType;
		select = null;
		filter = "scoredEmailAddresses/any(a: a/address eq \'" + this.getEmailAddress().getAddress() + "\')";
		PagedResult<Person> persons = outlookService.getPeople(select, filter).execute().body();
		Person person = persons.getValue()[0];
		preferedPhoneType = "mobile";
		if (person.getPhones() != null && !person.getPhones().isEmpty()) {
			for (Phone phone : person.getPhones()) {
				if (phone.getType().equals(preferedPhoneType)) {
					this.setPhone(phone);
				}
			}
		}
	}
}
