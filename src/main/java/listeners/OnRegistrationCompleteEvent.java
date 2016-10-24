package listeners;
 
import org.springframework.context.ApplicationEvent;

import models.User;

public class OnRegistrationCompleteEvent extends ApplicationEvent{

	private static final long serialVersionUID = -6176685297809096112L;
	private static final String APP_URL = "http://localhost:8080/connectionProfiler";
	private User user;
	
	public OnRegistrationCompleteEvent(User user) {
		super(user);
		this.user = user;
	}

	public User getUser() {
		return user;
	}

	public String getAppUrl() {
		return APP_URL;
	}
}