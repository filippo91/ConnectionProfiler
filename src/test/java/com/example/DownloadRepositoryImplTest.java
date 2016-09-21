package com.example;

import static org.junit.Assert.assertEquals;

import java.util.Collection;
import java.util.Date;

import org.joda.time.DateTime;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.junit4.SpringRunner;

import models.AvgDaySpeedDownload;
import models.BinLatencyDownload;
import models.BinSpeedDownload;
import models.Download;
import models.FrequencyAccess;
import models.SizeDownload;
import repositories.DownloadRepository;

@RunWith(SpringRunner.class)
@SpringBootTest(classes=com.example.TestMongodbForAiProjectApplication.class)
public class DownloadRepositoryImplTest {
	@Autowired DownloadRepository repo;
	
	//initialized in the init function, 
	//it contains the number of records loaded in the database
	private int nRecords;
	
	@Before
	public void init() {
		repo.deleteAll();

		/*
		//reading mock data from JSON file
		ObjectMapper mapper = new ObjectMapper();
		List<Download> mock_download = null;
		try {
			mock_download = mapper.readValue(new File("mock_data_2.json"), new TypeReference<List<Download>>(){});
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		nRecords = mock_download.size();
		
		repo.save(mock_download);
		*/
		for(int i = 0; i < 100; i++){
			Download d = new Download();
			d.setUuid(0);
			d.setTimestamp(new Date());
			d.setDownload_speed(new Long(1000+i));
			d = repo.save(d);
		}		
		
		
	}
	
	@Test
	public void RecordsReadAreEqualsToRecordsLoaded(){
		List<Download> allRecords = repo.findAll();
		assertEquals(allRecords.size(), nRecords);
	}
	
	@Test
	public void AvgDownloadsSpeed(){
		int uuid = 194;
		long timestamp = 1453978031888L;
		DateTime start = new DateTime(timestamp-10);
		DateTime end = new DateTime(timestamp+10);
		Collection<AvgDaySpeedDownload> result = repo.getAvgDayDownloadsSpeed(uuid, start.toDate(), end.toDate());
		assertEquals(result.size(), 1);
	}
	
	@Test
	public void FrequencyAccessesByDomain(){
		int uuid = 194;
		long timestamp = 1453978031888L;
		DateTime start = new DateTime(timestamp-10);
		DateTime end = new DateTime(timestamp+10);
		Collection<FrequencyAccess> result = repo.getFrequencyAccessesByDomain(uuid, start, end);
		assertEquals(result.size(), 1);
	}
	
	@Test
	public void SizeDownloadsByDomain(){
		int uuid = 194;
		long timestamp = 1453978031888L;
		DateTime start = new DateTime(timestamp-10);
		DateTime end = new DateTime(timestamp+10);
		Collection<SizeDownload> result = repo.getSizeDownloadsByDomain(uuid, start, end);
		assertEquals(result.size(), 1);
	}
	
	@Test
	public void LatencyBins(){
		int uuid = 194;
		long timestamp = 1453978031888L;
		DateTime start = new DateTime(timestamp-10);
		DateTime end = new DateTime(timestamp+10);
		int bin_width = 10;
		Collection<BinLatencyDownload> result = repo.getLatencyBins(bin_width, uuid, start, end);
		assertEquals(result.size(), 1);
	}
	
	@Test
	public void DownloadsSpeedBins(){
		int uuid = 194;
		long timestamp = 1453978031888L;
		DateTime start = new DateTime(timestamp-10);
		DateTime end = new DateTime(timestamp+10);
		int bin_width = 10;
		Collection<BinSpeedDownload> result = repo.getDownloadsSpeedBins(bin_width, uuid, start, end);
		assertEquals(result.size(), 1);
	}
	
	@Test
	public void FindAllByUuidOrderByTimestampDesc(){
		int uuid = 194;
		int nPage = 0;
		int pageSize = 2;
		Page<Download> page = repo.findAllByUuidOrderByTimestampDesc(uuid, new PageRequest(nPage, pageSize));
		Collection<Download> result = page.getContent();
		assertEquals(result.size(), 2);
	}
}
