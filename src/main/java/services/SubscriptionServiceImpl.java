package services;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import models.Bandwidth;
import models.ProviderPlan;
import models.SubscriptionSummary;
import models.User;
import models.UserSubscription;
import repositories.UserSubscriptionRepository;;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {
	Logger log = LoggerFactory.getLogger(SubscriptionServiceImpl.class);
	
	@Autowired UserSubscriptionRepository userSubscriptionRepository;
	@Autowired DownloadService downloadService;
	
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

	@Override
	public SubscriptionSummary getSubscriptionInfo(Integer uid, Integer asnum) {
		// TODO Auto-generated method stub
		SubscriptionSummary ss = new SubscriptionSummary();
		ProviderPlan pp = null;
		pp = userSubscriptionRepository.getProviderPlan(BigInteger.valueOf(uid), asnum);
		ss.setProviderPlan(pp);

		Bandwidth b = downloadService.getBandwidthSummary(uid, asnum);
		ss.setBandwidth(b);
		return ss;
	}

	@Override
	public List<SubscriptionSummary> getSubscriptionInfo(Integer uid) {
		List<SubscriptionSummary> ssl = new ArrayList<>();
		List<ProviderPlan> pps = null;
		pps = userSubscriptionRepository.getProviderPlans(BigInteger.valueOf(uid));
		
		Integer asnum;
		for(ProviderPlan pp : pps ){
			SubscriptionSummary ss = new SubscriptionSummary();
			ss.setProviderPlan(pp);
			asnum = pp.getAsnum();
			Bandwidth b = downloadService.getBandwidthSummary(uid, asnum);
			ss.setBandwidth(b);
			ssl.add(ss);
		}
		
		return ssl;
	}
}
