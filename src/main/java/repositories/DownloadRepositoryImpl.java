package repositories;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.group;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.match;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.newAggregation;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.project;

import java.util.Collection;
import java.util.List;

import org.joda.time.DateTime;
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
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(int uuid, DateTime start, DateTime end) {
		log.debug("start: "+ start + " end: " + end);
		
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start.toDate())),
				match(Criteria.where("timestamp").lt(end.toDate())),
				project("asnum", "asname", "download_speed", "timestamp")
					.and("timestamp").extractDayOfMonth().as("day"),
				group("asnum", "day")
					.avg("download_speed").as("speed")
					.min("timestamp").as("timestamp")
					.count().as("count")
					.first("asname").as("asname"),
				project("asnum", "speed", "count", "timestamp", "asname")
			);
		
		AggregationResults<AvgDaySpeedDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", AvgDaySpeedDownload.class);
		List<AvgDaySpeedDownload> mappedResult = results.getMappedResults();

		return mappedResult;
	}
	

	@Override
	public Collection<AvgDaySpeedDownload> getAvgDayDownloadsSpeed(DateTime start, DateTime end) {
		log.debug("start: "+ start + " end: " + end);
		
		Aggregation agg = newAggregation(
				match(Criteria.where("timestamp").gte(start.toDate())),
				match(Criteria.where("timestamp").lt(end.toDate())),
				project("asnum", "asname", "download_speed", "timestamp")
					.and("timestamp").extractDayOfMonth().as("day"),
				group("asnum", "day")
					.avg("download_speed").as("speed")
					.min("timestamp").as("timestamp")
					.count().as("count")
					.first("asname").as("asname"),
				project("asnum", "asname", "speed", "count", "timestamp")
			);
		
		AggregationResults<AvgDaySpeedDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", AvgDaySpeedDownload.class);
		List<AvgDaySpeedDownload> mappedResult = results.getMappedResults();
		
		return mappedResult;
	}
	

	@Override
	public Collection<BinSpeedDownload> getDownloadsSpeedBins(int bin_width, int uuid, DateTime start, DateTime end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start.toDate())),
				match(Criteria.where("timestamp").lt(end.toDate())),
				project("asnum", "asname").and("download_speed")
					.divide(bin_width).as("binFloat"),
				project("asnum", "asname")
					.andExpression("binFloat - binFloat % 1").as("bin"),
				group("asnum", "bin")
					.count().as("nRecords")
					.first("asname").as("asname"),
				project("nRecords", "asnum", "asname", "bin")
			);
		
		AggregationResults<BinSpeedDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", BinSpeedDownload.class);
		List<BinSpeedDownload> mappedResult = results.getMappedResults();
		
		return mappedResult;
	}
	
	@Override
	public Collection<BinSpeedDownload> getDownloadsSpeedBins(int bin_width, DateTime start, DateTime end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("timestamp").gte(start.toDate())),
				match(Criteria.where("timestamp").lt(end.toDate())),
		
				project("asnum", "asname")
					.and("download_speed").divide(bin_width).as("binFloat"),
				project("asnum", "asname")
					.andExpression("binFloat - binFloat % 1").as("bin"),
				group("asnum", "bin")
					.count().as("nRecords")
					.first("asname").as("asname"),
				project("nRecords", "asnum", "asname", "bin")
			);
		
		AggregationResults<BinSpeedDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", BinSpeedDownload.class);
		List<BinSpeedDownload> mappedResult = results.getMappedResults();
		
		return mappedResult;
	}
	
	@Override
	public Collection<BinLatencyDownload> getLatencyBins(int bin_width, int uuid, DateTime start, DateTime end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start.toDate())),
				match(Criteria.where("timestamp").lt(end.toDate())),
				project("asnum", "asname")
					.and("connect_time").divide(bin_width).as("binFloat"),
				project("asnum", "asname")
					.andExpression("binFloat - binFloat % 1").as("bin"),
				group("asnum", "bin")
					.count().as("nRecords")
					.first("asname").as("asname"),
				project("asnum", "asname", "bin", "nRecords")
			);
		
		AggregationResults<BinLatencyDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", BinLatencyDownload.class);
		List<BinLatencyDownload> mappedResult = results.getMappedResults();

		return mappedResult;
	}


	@Override
	public Collection<FrequencyAccess> getFrequencyAccessesByDomain(int uuid, DateTime start, DateTime end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start.toDate())),
				match(Criteria.where("timestamp").lt(end.toDate())), 
				project("server_domain"),
				group("server_domain").count().as("nRecords"),
				project("nRecords").and("server_domain").previousOperation()

			);
		
		
		AggregationResults<FrequencyAccess> results = mongoTemplate.aggregate(agg, "DOWNLOADS", FrequencyAccess.class);
		List<FrequencyAccess> mappedResult = results.getMappedResults();
		
		return mappedResult;
	}


	@Override
	public Collection<SizeDownload> getSizeDownloadsByDomain(int uuid, DateTime start, DateTime end) {
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("timestamp").gte(start.toDate())),
				match(Criteria.where("timestamp").lt(end.toDate())),
				project("server_domain", "size"),
				group("server_domain").sum("size").as("size"),
				project("size").and("server_domain").previousOperation()
			);
		
		AggregationResults<SizeDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", SizeDownload.class);
		List<SizeDownload> mappedResult = results.getMappedResults();

		return mappedResult;
	}


	@Override
	public Collection<BinLatencyDownload> getLatencyBins(int bin_width, DateTime start, DateTime end) {
		
		Aggregation agg = newAggregation(
				match(Criteria.where("timestamp").gte(start.toDate())),
				match(Criteria.where("timestamp").lt(end.toDate())),
				project("asnum").and("connect_time").divide(bin_width).as("bin"),
				group("asnum", "bin").count().as("nRecords"),
				project("asnum", "bin", "nRecords")
			);
		
		AggregationResults<BinLatencyDownload> results = mongoTemplate.aggregate(agg, "DOWNLOADS", BinLatencyDownload.class);
		List<BinLatencyDownload> mappedResult = results.getMappedResults();

		return mappedResult;
	}
	
	@Override
	public Bandwidth getBandwidthSummary(int uuid, int asnum) {
		
		Aggregation agg = newAggregation(
				match(Criteria.where("uuid").is(uuid)),
				match(Criteria.where("asnum").is(asnum)),
				project("asnum", "download_speed"),
				group("asnum")
					.count().as("samples")
					.avg("download_speed").as("average")
					.min("download_speed").as("minimum")
					.max("download_speed").as("maximum"),
				project("samples", "average", "minimum", "maximum")
			);
		
		AggregationResults<Bandwidth> results = mongoTemplate.aggregate(agg, "DOWNLOADS", Bandwidth.class);
		List<Bandwidth> mappedResult = results.getMappedResults();
		
		if(mappedResult.size() == 0){
			//TODO
			return new Bandwidth();
		}
		
		return mappedResult.get(0);
	}
}
