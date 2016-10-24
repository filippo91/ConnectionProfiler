package listeners;

import org.springframework.context.ApplicationEvent;

import models.User;

public class OnEmailVerifiedEvent extends ApplicationEvent{

	/**
	 * 
	 */
	private static final long serialVersionUID = -6984736206956113057L;

	private User user;

	public OnEmailVerifiedEvent(User user) {
		super(user);
		this.user = user;
	}
	
	
	public User getUser() {
		return user;
	}
}
