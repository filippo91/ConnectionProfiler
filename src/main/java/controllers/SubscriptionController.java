package controllers;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import models.ProviderPlan;
import models.UserSubscription;
import models.User;
import services.SubscriptionService;

@RestController
public class SubscriptionController {
	Logger log = LoggerFactory.getLogger(SubscriptionController.class);
	@Autowired SubscriptionService subscriptionService;

	@RequestMapping(value="/subscriptions", method=RequestMethod.POST)
	public void addSubscription(
			@AuthenticationPrincipal User user, 
			@RequestBody ProviderPlan plan){ 
		log.info("A subscription has arrived: " + plan);
		
		subscriptionService.addSubscription(plan, user);
	}

	@RequestMapping(value="/subscriptions", method=RequestMethod.GET)
	public List<ProviderPlan> getSubscriptions(@AuthenticationPrincipal User user){ 
		return subscriptionService.getSubscriptions(user);
	}
	
	@RequestMapping(value="/subscriptions/{asnum}", method=RequestMethod.GET)
	public UserSubscription getSubscription(@AuthenticationPrincipal User user){
		//TODO
		return null;
	}
}
