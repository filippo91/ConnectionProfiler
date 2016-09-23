package repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import models.Download;

@Repository
public interface DownloadRepository extends MongoRepository<Download, String>, CustomDownloadRepository{
	/**
	 * 
	 * @param uuid user unique identifier
	 * @param pageable specify page request (page number and page size) 
	 * @return all the information about user downloads, presented in 
	 * descending order by resource request time
	 * 
	 */
	Page<Download> findAllByUuidOrderByTimestampDesc(int uuid, Pageable pageable);

	
	
}
