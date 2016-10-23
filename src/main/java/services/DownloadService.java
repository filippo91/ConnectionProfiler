package services;

import java.util.Collection;

import org.springframework.security.access.prepost.PreAuthorize;

import models.Bandwidth;
import models.Download;

public interface DownloadService {
	@PreAuthorize("isAuthenticated()")
	public Download saveDownload(Download download);
	
	@PreAuthorize("isAuthenticated()")
	public Collection<Download> saveDownload(Collection<Download> download);

	public Bandwidth getBandwidthSummary(Integer uid, Integer asnum);
}