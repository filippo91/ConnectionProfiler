package repositories;

import java.math.BigInteger;

import org.springframework.data.repository.NoRepositoryBean;

import models.ProviderPlan;

@NoRepositoryBean
public interface CustomUserSubscriptionRepository {
	void pushProviderPlan(BigInteger userId, ProviderPlan plan);
}
