package pl.itutil.ecu.service;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Headers;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface OutlookService {

	@GET("/api/v2.0/me")
	Call<OutlookUser> getCurrentUser();

	@GET("/api/v2.0/me/mailfolders/{folderid}/messages")
	Call<PagedResult<Message>> getMessages(@Path("folderid") String folderId, @Query("$orderby") String orderBy,
			@Query("$select") String select, @Query("$top") Integer maxResults);

	@GET("/api/v2.0/me/events")
	Call<PagedResult<Event>> getEvents(@Query("$orderby") String orderBy, @Query("$select") String select,
			@Query("$top") Integer maxResults);

	@GET("/api/v2.0/me/contacts")
	Call<PagedResult<Contact>> getContacts(@Query("$orderby") String orderBy, @Query("$select") String select,
			@Query("$top") Integer maxResults);

	@GET("/api/v2.0/me/people('{roomId}')")
	Call<Location> getRoomById(@Path("roomId") String roomId);

	@GET("/api/v2.0/users/{roomEmail}")
	Call<Location> getRoomByEmail(@Path("roomEmail") String roomEmail);

	// https://graph.microsoft.com/v1.0/me/people?$select=displayName,userPrincipalName&$filter=personType/subclass
	// EQ 'Room'
	@GET("/api/v2.0/me/people")
	Call<PagedResult<Room>> getRooms(@Query("$select") String select, @Query("$filter") String filter);

	@Headers("Content-type: application/json")
//	/users/{id | userPrincipalName}/events
	@POST("/api/beta/users/ecroom1@itutil.com/events")
	Call<Object> makeEvent(@Body Event event);

	// https://graph.microsoft.com/beta/users/ecroom1@itutil.com/calendarview?startdatetime=2017-10-12T10:00:00&enddatetime=2017-10-12T18:00:00
	@GET("/api/beta/users/{userEmail}/calendarview")
	Call<PagedResult<Event>> getUserEventsInGivenTime(@Path("userEmail") String userEmail,
			@Query("startdatetime") String startDateTime, @Query("enddatetime") String endDateTime);

	// https://graph.microsoft.com/v1.0/me/people?$filter=personType/subclass EQ
	// 'OrganizationUser'
	@GET("/api/v2.0/me/people")
	Call<PagedResult<Object>> getUsers(@Query("$filter") String filter);

	@GET("/api/beta/me/events/{eventId}")
	Call<Event> getEvent(@Path("eventId") String eventId);

	// /users/ecroom1@itutil.com/calendar/events/{id}
	@DELETE("/api/v1.0/users/{userEmail}/calendar/events/{eventId}")
	Call<Object> deleteEvent(@Path("userEmail") String userEmail, @Path("eventId") String eventId);
}
