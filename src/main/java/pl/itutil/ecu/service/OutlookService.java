package pl.itutil.ecu.service;

import pl.itutil.ecu.auth.TokenResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.GET;
import retrofit2.http.Headers;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface OutlookService {

	@GET("/v1.0/me")
	Call<OutlookUser> getCurrentUser();

	@GET("/v1.0/me/events")
	Call<PagedResult<Event>> getEvents(@Query("$orderby") String orderBy, @Query("$select") String select,
			@Query("$top") Integer maxResults);

	@GET("/v1.0/me/people('{roomId}')")
	Call<Location> getRoomById(@Path("roomId") String roomId);

	@GET("/v1.0/users/{roomEmail}")
	Call<Location> getRoomByEmail(@Path("roomEmail") String roomEmail);

	// https://graph.microsoft.com/v1.0/me/people?$select=displayName,userPrincipalName&$filter=personType/subclass
	// EQ 'Room'
	@GET("/v1.0/me/people")
	Call<PagedResult<Room>> getRooms(@Query("$select") String select, @Query("$filter") String filter);

	@Headers("Content-type: application/json")
	// /users/{id | userPrincipalName}/events
	@POST("/beta/users/ecroom1@itutil.com/events")
	Call<Object> makeEvent(@Body Event event);

	// https://graph.microsoft.com/beta/users/ecroom1@itutil.com/calendarview?startdatetime=2017-10-12T10:00:00&enddatetime=2017-10-12T18:00:00
	@GET("/beta/users/{userEmail}/calendarview")
	Call<PagedResult<Event>> getUserEventsInGivenTime(@Path("userEmail") String userEmail,
			@Query("startdatetime") String startDateTime, @Query("enddatetime") String endDateTime);

	// https://graph.microsoft.com/v1.0/me/people?$filter=personType/subclass EQ
	// 'OrganizationUser'
	@GET("/v1.0/me/people")
	Call<PagedResult<Object>> getUsers(@Query("$filter") String filter);

	@GET("/beta/me/events/{eventId}")
	Call<Event> getEvent(@Path("eventId") String eventId);

	// /users/ecroom1@itutil.com/calendar/events/{id}
	@DELETE("/v1.0/users/{userEmail}/calendar/events/{eventId}")
	Call<Object> deleteEvent(@Path("userEmail") String userEmail, @Path("eventId") String eventId);
	
	@Headers("Content-Type: application/json")
	@PATCH("/v1.0/users/{userEmail}/calendar/events/{eventId}")
	Call<Object> endEvent(@Path("userEmail") String userEmail, @Path("eventId") String eventId, @Body Event event);
	
	//https://graph.microsoft.com/v1.0/me/people?$filter=scoredEmailAddresses/any(a: a/address eq 'piotr.matosek@itutil.com')&$select=phones 
	@GET("/v1.0/me/people")
	Call<PagedResult<Person>> getPeople(@Query("$select") String select, @Query("$filter") String filter);
}
