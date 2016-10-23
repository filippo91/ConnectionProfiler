package services;

import java.math.BigInteger;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import models.ProviderPlan;
import models.UserSubscription;
import models.User;
import repositories.UserSubscriptionRepository;;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {
	Logger log = LoggerFactory.getLogger(SubscriptionServiceImpl.class);
	
	@Autowired UserSubscriptionRepository userSubscriptionRepository;

	@Override
	public void addSubscription(ProviderPlan plan, User user) {
		BigInteger mongoId = new BigInteger(user.getUid().toString());
		log.info("userid: " + mongoId);
		userSubscriptionRepository.pushProviderPlan(mongoId, plan);
		
		log.info("new subscription added");
	}

	@Override
	public void create(Integer uid) {
		BigInteger mongoId = new BigInteger(uid.toString());
		UserSubscription sub = new UserSubscription();
		sub.setUid(mongoId);
		userSubscriptionRepository.save(sub);
	}

	@Override
	public List<ProviderPlan> getSubscriptions(User user) {
		BigInteger mongoId = new BigInteger(user.getUid().toString());
		UserSubscription s = userSubscriptionRepository.findOne(mongoId);
		
		List<ProviderPlan> pp = null;
		
		if(s != null){
			pp = s.getProviderPlans();
		}
		
		return pp;
	}
}
