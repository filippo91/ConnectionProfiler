package services;

import java.util.List;

import models.ProviderPlan;
import models.User;

public interface SubscriptionService {
	List<ProviderPlan> getSubscriptions(User user);
	void addSubscription(ProviderPlan plan, User user);
	void create(Integer uid);
}
