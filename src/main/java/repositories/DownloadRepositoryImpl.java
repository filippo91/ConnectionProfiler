package repositories;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.group;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.match;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.newAggregation;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.project;

import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;



import models.*;

public class DownloadRepositoryImpl implements CustomDownloadRepository {
	private static final Logger log = LoggerFactory.getLogger(DownloadRepositoryImpl.class);
	
	@Autowired
	private MongoTemplate mongoTemplate;
	

	@Override
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int uuid, Date start, Date end) {
		log.debug("start: "+ start + " end: " + end);
		
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start)),
				match(Criteria.where("timestamp").lt(end)),
				
				project("asnum", "download_speed", "timestamp").and("timestamp").extractDayOfMonth().as("day"),
				group("asnum", "day").avg("download_speed").as("speed").min("timestamp").as("timestamp").count().as("count"),
				project("asnum", "speed", "count", "timestamp")
			);
		
		AggregationResults<AvgDaySpeedDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", AvgDaySpeedDownload.class);
		List<AvgDaySpeedDownload> mappedResult = results.getMappedResults();
		System.out.println(mappedResult);
		return mappedResult;
	}
	

	@Override
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(Date start, Date end) {
		log.debug("start: "+ start + " end: " + end);
		
		Aggregation agg = newAggregation(
				match(Criteria.where("timestamp").gte(start)),
				match(Criteria.where("timestamp").lt(end)),
				
				project("asnum", "download_speed", "timestamp").and("timestamp").extractDayOfMonth().as("day"),//.and("timestamp").extractDayOfMonth().as("day"),
				group("asnum", "day").avg("download_speed").as("speed").min("timestamp").as("timestamp").count().as("count"),
				project("asnum", "speed", "count", "timestamp")
			);
		
		AggregationResults<AvgDaySpeedDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", AvgDaySpeedDownload.class);
		List<AvgDaySpeedDownload> mappedResult = results.getMappedResults();
		
		return mappedResult;
	}
	

	@Override
	public Collection<BinSpeedDownload> getDownloadsSpeedBins(int bin_width, int uuid, Date start, Date end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start)),
				match(Criteria.where("timestamp").lt(end)),
		
				project("asnum").and("download_speed").mod(bin_width).as("bin"),
				group("asnum", "bin").count().as("nRecords"),
				project("asnum", "bin").and("nRecords")
			);
		
		AggregationResults<BinSpeedDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", BinSpeedDownload.class);
		List<BinSpeedDownload> mappedResult = results.getMappedResults();
		
		return mappedResult;
	}
	
	@Override
	public Collection<BinSpeedDownload> getDownloadsSpeedBins(int bin_width, Date start, Date end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("timestamp").gte(start)),
				match(Criteria.where("timestamp").lt(end)),
		
				project("asnum").and("download_speed").mod(bin_width).as("bin"),
				group("asnum", "bin").count().as("nRecords"),
				project("asnum", "bin").and("nRecords")
			);
		
		AggregationResults<BinSpeedDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", BinSpeedDownload.class);
		List<BinSpeedDownload> mappedResult = results.getMappedResults();
		
		return mappedResult;
	}
	
	@Override
	public Collection<BinLatencyDownload> getLatencyBins(int bin_width, int uuid, Date start, Date end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start)),
				match(Criteria.where("timestamp").lt(end)),
				project("asnum").and("connect_time").divide(bin_width).as("bin"),
				group("asnum", "bin").count().as("nRecords"),
				project("asnum", "bin", "nRecords")
			);
		
		AggregationResults<BinLatencyDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", BinLatencyDownload.class);
		List<BinLatencyDownload> mappedResult = results.getMappedResults();

		return mappedResult;
	}


	@Override
	public Collection<FrequencyAccess> getFrequencyAccessesByDomain(int uuid, Date start, Date end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start)),
				match(Criteria.where("timestamp").lt(end)), 
				project("server_domain"),
				group("server_domain").count().as("nRecords"),
				project("nRecords").and("server_domain").previousOperation()

			);
		
		
		AggregationResults<FrequencyAccess> results = mongoTemplate.aggregate(agg, "DOWNLOADS", FrequencyAccess.class);
		List<FrequencyAccess> mappedResult = results.getMappedResults();
		
		System.out.println("getFrequencyAccessesByDomain: " + mappedResult);
		
		return mappedResult;
	}


	@Override
	public Collection<SizeDownload> getSizeDownloadsByDomain(int uuid, Date start, Date end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start)),
				match(Criteria.where("timestamp").lt(end)),
				project("server_domain", "size"),
				group("server_domain").sum("size").as("size"),
				project("size").and("server_domain").previousOperation()
			);
		
		AggregationResults<SizeDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", SizeDownload.class);
		List<SizeDownload> mappedResult = results.getMappedResults();
		log.debug(mappedResult.toString());
		return mappedResult;
	}


	@Override
	public Collection<BinLatencyDownload> getLatencyBins(int bin_width, Date start, Date end) {
		
		Aggregation agg = newAggregation(
				match(Criteria.where("timestamp").gte(start)),
				match(Criteria.where("timestamp").lt(end)),
				project("asnum").and("connect_time").divide(bin_width).as("bin"),
				group("asnum", "bin").count().as("nRecords"),
				project("asnum", "bin", "nRecords")
			);
		
		AggregationResults<BinLatencyDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", BinLatencyDownload.class);
		List<BinLatencyDownload> mappedResult = results.getMappedResults();

		return mappedResult;
	}
}
