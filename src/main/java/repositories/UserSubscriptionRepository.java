package repositories;

import java.math.BigInteger;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import models.UserSubscription;

@Repository
public interface UserSubscriptionRepository extends MongoRepository<UserSubscription, BigInteger>, CustomUserSubscriptionRepository {

}
