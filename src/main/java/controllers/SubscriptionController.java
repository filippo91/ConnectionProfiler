package controllers;

import java.util.List;

import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import models.ProviderPlan;
import models.SubscriptionSummary;
import models.User;
import services.SubscriptionService;

@RestController
public class SubscriptionController {
	Logger log = LoggerFactory.getLogger(SubscriptionController.class);
	@Autowired SubscriptionService subscriptionService;

	@RequestMapping(value="/subscriptions", method=RequestMethod.POST)
	public void addSubscription(
			@AuthenticationPrincipal User user, 
			@RequestBody @Valid ProviderPlan plan){ 
		log.info("A subscription has arrived: " + plan);
		
		subscriptionService.addSubscription(plan, user);
	}

	@RequestMapping(value="/subscriptions", method=RequestMethod.GET)
	public List<ProviderPlan> getSubscriptions(@AuthenticationPrincipal User user){ 
		return subscriptionService.getSubscriptions(user);
	}
	
	@RequestMapping(value="/subscriptions/summary/{asnum}", method=RequestMethod.GET)
	public SubscriptionSummary getSubscriptionInfo(@AuthenticationPrincipal User user, @PathVariable Integer asnum){
		//TODO
		return subscriptionService.getSubscriptionInfo(user.getUid(), asnum);
	}
	
	@RequestMapping(value="/subscriptions/summary", method=RequestMethod.GET)
	public List<SubscriptionSummary> getSubscriptionsInfo(@AuthenticationPrincipal User user){
		//TODO:do query and get results
		return subscriptionService.getSubscriptionInfo(user.getUid());
	}
}
