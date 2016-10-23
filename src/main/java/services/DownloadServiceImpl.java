package services;

import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import models.*;
import repositories.DownloadRepository;


@Service
public class DownloadServiceImpl implements DownloadService {	
	@Autowired
	private DownloadRepository downloadRepository;
	
	@Override
	public Download saveDownload(Download download) {
		return downloadRepository.save(download);
	}

	@Override
	public Collection<Download> saveDownload(Collection<Download> download) {
		return downloadRepository.save(download);
	}
}
