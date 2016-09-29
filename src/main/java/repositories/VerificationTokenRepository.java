package repositories;

import org.springframework.data.repository.CrudRepository;

import models.VerificationToken;

public interface VerificationTokenRepository extends CrudRepository<VerificationToken, Long>{

	VerificationToken findByToken(String token);

}
