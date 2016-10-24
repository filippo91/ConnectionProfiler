package listeners;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import models.User;
import services.SubscriptionService;

@Component
public class EmailVerifiedListener implements ApplicationListener<OnEmailVerifiedEvent>{

	@Autowired private SubscriptionService subscriptionService;

	@Override
	public void onApplicationEvent(OnEmailVerifiedEvent event) {
		User user = event.getUser();
		subscriptionService.create(user.getUid());
	}

}
