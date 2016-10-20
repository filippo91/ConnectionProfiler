package services;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import models.Download;
import repositories.DownloadRepository;

@RunWith(MockitoJUnitRunner.class)
public class DownloadServiceTest {
	@Mock
	private DownloadRepository downloadRepository;
	
	@InjectMocks
	private DownloadService downloadService = new DownloadServiceImpl();
	
	@Test
	public void shouldReturnSavedObject(){		
		Download download = new Download();
		download.setId("unique_id");
		when(downloadRepository.save(download)).thenReturn(download);
		
		Download savedDownload = downloadService.saveDownload(download);
		
		verify(downloadRepository, times(1)).save(any(Download.class));
		assertEquals(savedDownload, download);
	}
	
	@Test
	public void shouldReturnSavedCollection(){		
		final int N_DOWNLOADS = 10;
		Download download;
		List<Download> downloads = new ArrayList<>();
		
		for(int i = 0; i < N_DOWNLOADS; i++){
			download = new Download();
			download.setId("unique_id"+i);
			downloads.add(download);
		}
		
		when(downloadRepository.save(downloads)).thenReturn(downloads);
		
		Collection<Download> savedDownloads = downloadService.saveDownload(downloads);
		
		assertEquals(savedDownloads, downloads);
	}
}
