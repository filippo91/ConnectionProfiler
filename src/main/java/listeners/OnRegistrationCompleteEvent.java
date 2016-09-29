package listeners;
 

import org.springframework.context.ApplicationEvent;

import models.User;

public class OnRegistrationCompleteEvent extends ApplicationEvent{

	private static final long serialVersionUID = -6176685297809096112L;
	
	private User user;
	private String appUrl;
	private String token;
	
	public OnRegistrationCompleteEvent(User user, String appUrl, String token) {
		super(user);
		this.user = user;
		this.appUrl = appUrl;
		this.token = token;
	}

	public User getUser() {
		return user;
	}

	public String getAppUrl() {
		return appUrl;
	}
	
	public String getToken() {
		return token;
	}
}