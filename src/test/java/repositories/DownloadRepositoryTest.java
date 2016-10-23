package repositories;

import java.util.Collection;

import org.joda.time.DateTime;
import org.joda.time.DateTimeConstants;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import models.AvgDaySpeedDownload;
import models.BinLatencyDownload;
import models.BinSpeedDownload;
import models.Download;
import models.FrequencyAccess;
import models.SizeDownload;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DownloadRepositoryTestConfiguration.class)
public class DownloadRepositoryTest {
	private static final int N_WEEKS = 2;
	private static final int N_RECORDS_PER_WEEKDAY = 10;
	private static final int N_USERS = 5;
	private static final String[] DOMAIN = { "google.com", "yahoo.com", "facebook.com" };
	private static final String[] ASNAME = { "vodafone", "tim", "fastweb" };
	private static final Integer[] ASNUM = { 1, 2, 3 };
	private static final int BIN_WIDTH = 10;
	private static final int N_BINS = 3;
	private static final long[] SPEED = {10, 20, 30};
	private static final int[] CONNECT_TIME = {10, 20, 30};
	
	
	private DateTime start = new DateTime(0).withDayOfWeek(DateTimeConstants.MONDAY).plusWeeks(1);
	
	@Autowired
	DownloadRepository downloadRepository;

	@Before
	public void init() {
		DateTime date = start;
		Download d;
		int uuid;
		
		for (int j = 0; j < N_USERS; j++) {
			uuid = j;
			for (int k = 0; k < DateTimeConstants.DAYS_PER_WEEK * N_WEEKS; k++) {
				for(int z = 0; z < ASNUM.length; z++){
					for (int i = 0; i < N_RECORDS_PER_WEEKDAY || i < N_BINS; i++) {
						d = new Download();
						d.setUuid(uuid);
						d.setAsname(ASNAME[z]);
						d.setAsnum(ASNUM[z]);
						d.setTimestamp(date.toDate());
						d.setDownload_speed(SPEED[i%SPEED.length]);
						d.setSize(1L);
						d.setDuration(1L);
						d.setResource_type("img/jpg");
						d.setServer_domain(DOMAIN[i % DOMAIN.length]);
						d.setConnect_time(CONNECT_TIME[i%CONNECT_TIME.length]);
						d.setClient_address("31.10.5.7");
	
						downloadRepository.save(d);
					}
				}
				
				date = date.plusDays(1);
			}
		}
		
		Collection<Download> allRecords = downloadRepository.findAll();
		int expectedRecords = N_WEEKS * N_RECORDS_PER_WEEKDAY * DateTimeConstants.DAYS_PER_WEEK * N_USERS*ASNUM.length;
		
		assert(allRecords.size() == expectedRecords);
	}

	@After
	public void tearDown() {
		downloadRepository.deleteAll();
	}

	@Test
	public void getSizeDownloadsByDomain_shouldReturnOneRecordPerDomain() {
		int uuid = 0;
		DateTime end = start.plusDays(7);
		Collection<SizeDownload> result = downloadRepository.getSizeDownloadsByDomain(uuid, start, end);

		assert (result.size() == DOMAIN.length);
	}
	
	@Test
	public void getFrequencyAccessesByDomain_shouldReturnOneRecordPerDomain() {
		int uuid = 0;
		DateTime end = start.plusDays(7);
		Collection<FrequencyAccess> result = downloadRepository.getFrequencyAccessesByDomain(uuid, start, end);

		assert (result.size() == DOMAIN.length);
	}
	

	@Test
	public void getLatencyBins_shouldReturnOneRecordPerBin() {
		int uuid = 0;
		DateTime end = start.plusDays(7);
		Collection<BinLatencyDownload> result = downloadRepository.getLatencyBins(BIN_WIDTH, uuid, start, end);

		int expectedResult =  N_BINS * ASNAME.length;
		assert (result.size() == expectedResult);
	}
	
	@Test
	public void getAvgDayDownloadsSpeed_shouldReturnOneRecordPerDay() {
		int uuid = 0;
		DateTime end = start.plusDays(7);
		Collection<AvgDaySpeedDownload> result = downloadRepository.getAvgDayDownloadsSpeed(uuid, start, end);

		int expectedResult = DateTimeConstants.DAYS_PER_WEEK * ASNAME.length;
		
		assert (result.size() == expectedResult);
	}
	
	@Test
	public void getAvgDayDownloadsSpeed_Public_shouldReturnOneRecordPerDay() {
		DateTime end = start.plusDays(7);
		Collection<AvgDaySpeedDownload> result = downloadRepository.getAvgDayDownloadsSpeed(start, end);

		int expectedResult = DateTimeConstants.DAYS_PER_WEEK * ASNAME.length;
		
		assert (result.size() == expectedResult);
	}
	
	@Test
	public void getDownloadsSpeedBins_shouldReturnOneRecordPerBin() {
		int uuid = 0;
		DateTime end = start.plusDays(7);
		Collection<BinSpeedDownload> result = downloadRepository.getDownloadsSpeedBins(BIN_WIDTH, uuid, start, end);

		int expectedResult = N_BINS * ASNAME.length;
		
		assert (result.size() == expectedResult);
	}
	
	@Test
	public void getDownloadsSpeedBins_Public_shouldReturnOneRecordPerBin() {
		DateTime end = start.plusDays(7);
		Collection<BinSpeedDownload> result = downloadRepository.getDownloadsSpeedBins(BIN_WIDTH, start, end);

		int expectedResult = N_BINS * ASNAME.length;
		
		assert (result.size() == expectedResult);
	}
	
}
