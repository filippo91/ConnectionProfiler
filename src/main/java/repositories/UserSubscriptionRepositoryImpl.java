package repositories;

import static org.springframework.data.mongodb.core.query.Criteria.where;

import java.math.BigInteger;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import models.ProviderPlan;
import models.UserSubscription;


public class UserSubscriptionRepositoryImpl implements CustomUserSubscriptionRepository {
	Logger log = LoggerFactory.getLogger(UserSubscriptionRepositoryImpl.class);
	
	@Autowired MongoTemplate mongoTemplate;
	
	@Override
	public void pushProviderPlan(BigInteger userId, ProviderPlan plan) {
		Update update = new Update();
		update.push("providerPlans", plan);
		Query query = Query.query(where("_id").is(userId));
		
		mongoTemplate.updateFirst(query, update, UserSubscription.class);
		log.info("looking for id: "+userId);
		UserSubscription s = mongoTemplate.findOne(Query.query(where("_id").is(userId)), UserSubscription.class);
	    log.info("Updated: " + s);
	}

	@Override
	public ProviderPlan getProviderPlan(BigInteger userId, Integer asnum) {
		UserSubscription s = mongoTemplate.findOne(Query.query(where("_id").is(userId)), UserSubscription.class);
		
		if(s == null){
			//TODO: throw exception: providerPlanNotFound
		}
		
		ProviderPlan found = null;
		for(ProviderPlan pp : s.getProviderPlans()){
			if(pp.getAsnum().equals(asnum)){
				found = pp;
			}
		}
		
		if(found == null){
			//TODO: throw exception: providerPlanNotFound
		}
		
		return found;
	}

	@Override
	public List<ProviderPlan> getProviderPlans(BigInteger userId) {
		UserSubscription s = mongoTemplate.findOne(Query.query(where("_id").is(userId)), UserSubscription.class);
		
		if(s == null){
			return Collections.emptyList();
		}
		
		return s.getProviderPlans();
	}

}
