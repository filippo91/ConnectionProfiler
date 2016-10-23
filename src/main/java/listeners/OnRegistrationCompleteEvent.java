package listeners;
 
import org.springframework.context.ApplicationEvent;

import models.User;
import models.VerificationToken;

public class OnRegistrationCompleteEvent extends ApplicationEvent{

	private static final long serialVersionUID = -6176685297809096112L;
	private static final String APP_URL = "http://localhost:8080/connectionProfiler";
	
	private VerificationToken verificationToken;
	
	public OnRegistrationCompleteEvent(VerificationToken verificationToken) {
		super(verificationToken);
		this.verificationToken = verificationToken;
	}

	public User getUser() {
		return verificationToken.getUser();
	}

	public String getAppUrl() {
		return APP_URL;
	}
	
	public String getToken() {
		return verificationToken.getToken();
	}
}