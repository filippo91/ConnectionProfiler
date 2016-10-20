package services;

import static org.junit.Assert.assertEquals;

import org.joda.time.DateTime;
import org.joda.time.DateTimeConstants;
import org.joda.time.DateTimeFieldType;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import repositories.DownloadRepository;
import services.PlotsService.View;

@RunWith(MockitoJUnitRunner.class)
public class PlotsServiceTest {
	@Mock DownloadRepository downloadRepository;
	
	@InjectMocks
	PlotsServiceImpl plotsService;	
	
	@Test
	public void weeksShouldStartOnMonday(){
		int year = 2016;
		int month = 6; // July
		int day = 31;
		int MONDAY = DateTimeConstants.MONDAY;
		
		View weekView = View.week;
		
		DateTime date = plotsService.getStartDate(year, month, day, weekView);

		assertEquals(date.get(DateTimeFieldType.dayOfWeek()), MONDAY);
	}
}
