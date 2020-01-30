from .DocAnalyzer import DocAnalyzer
from .DocIOHelper import DocIOHelper
import numpy as np


class NarrativeAnalyzer:
    '''
        Used for analyze narrative
        1. Find connections between each character for each chapter
        2. Sentiment Analysis for each chapter
        3. Document Cohesiveness Measure between each chapter
    '''

    def __init__(self):
        self.docAnalyzer = DocAnalyzer()

    def analyze_sents(self, path):
        document = DocIOHelper.read_doc_n_prep(path)
        document = DocIOHelper.split_chapters(document, "CHAPTER")
        sentiment = [self.docAnalyzer.extract_sentiment_from_chapter(chapter) for chapter in document]
        return sentiment

    def analyze_location_conns(self, path, location_path=""):
        document = DocIOHelper.read_doc_n_prep(path)
        document = DocIOHelper.split_chapters(document, "CHAPTER")
        locations = []
        with open(location_path) as file:
            locations = file.readlines()
            locations = [i.strip() for i in locations]
        if len(locations) != 0:
            location_conn = [self.docAnalyzer.extract_location_with_list(chapter, locations) for chapter in document]
        else:
            location_conn = [self.docAnalyzer.extract_location_from_chapter(chapter) for chapter in document]
        return location_conn

    def analyze_conns(self, path, charcter_path=""):
        document = DocIOHelper.read_doc_n_prep(path)
        document = DocIOHelper.split_chapters(document, "CHAPTER")
        characters = []
        with open(charcter_path) as file:
            characters = file.readlines()
            characters = [i.strip() for i in characters]
        conns = []
        if len(characters) != 0:
            conns = [self.docAnalyzer.extract_conns_with_entities(chapter, characters) for chapter in document]
        else:
            conns = [self.docAnalyzer.extract_conns_from_chapter(chapter) for chapter in document]
        return conns

    def analyze_cohesive(self, path):
        document = DocIOHelper.read_doc_n_prep(path)
        document = DocIOHelper.split_chapters(document, "CHAPTER")
        document_cohesiveness = [self.docAnalyzer.cohesiveness_between_chapters(document)]
        document_cohesiveness = np.array(document_cohesiveness)
        return document_cohesiveness
