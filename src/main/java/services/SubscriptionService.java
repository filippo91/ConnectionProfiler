package services;

import java.util.List;

import models.ProviderPlan;
import models.SubscriptionSummary;
import models.User;
import models.UserSubscription;

public interface SubscriptionService {
	List<ProviderPlan> getSubscriptions(User user);
	void addSubscription(ProviderPlan plan, User user);
	void create(Integer uid);
	SubscriptionSummary getSubscriptionInfo(Integer uid, Integer asnum);
	List<SubscriptionSummary> getSubscriptionInfo(Integer uid);
}
