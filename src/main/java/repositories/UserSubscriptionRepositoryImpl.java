package repositories;

import static org.springframework.data.mongodb.core.query.Criteria.where;

import java.math.BigInteger;

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

}
