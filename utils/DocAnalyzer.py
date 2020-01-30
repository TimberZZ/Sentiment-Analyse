from .DocIOHelper import DocIOHelper
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
from nltk import word_tokenize
import string
from nltk import ne_chunk, pos_tag
from nltk.sentiment.vader import SentimentIntensityAnalyzer

from textblob import TextBlob
import spacy
from gensim import corpora, similarities, models
from gensim.parsing.preprocessing import remove_stopwords


class DocAnalyzer:

    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        self.ner = ne_chunk
        self.pos_tag = pos_tag
        self.nlp = spacy.load('en_core_web_sm')
        self.text_blob = TextBlob

    def extract_conns_with_entities(self, chapter, entities_set):
        '''

        :param chapter:chapter waiting to be processed, a list of sentences,entities_set contains entities we care about
        :return: characters, connections
        '''
        title = chapter[0]
        paragraphs = chapter[1:]

        entities = [([entity for entity in entities_set if entity.split()[0].lower() in paragraph.lower()], paragraph) for paragraph in paragraphs]

        entities = [pair for pair in entities if len(pair[0]) != 0]

        connections = {}
        for pair in entities:
            entity = set(pair[0])
            if len(entity) <= 1:
                continue
            entity = list(entity)
            for ind in range(0, len(entity)):
                for other_ind in range(ind + 1, len(entity)):
                    a = entity[ind]
                    b = entity[other_ind]
                    if a not in connections:
                        connections[a] = {}
                    if b not in connections[a]:
                        connections[a][b] = 0
                    connections[a][b] += 1

                    if b not in connections:
                        connections[b] = {}
                    if a not in connections[b]:
                        connections[b][a] = 0
                    connections[b][a] += 1

        return connections

    def extract_conns_from_chapter(self, chapter):
        '''

        :param chapter:chapter waiting to be processed, a list of sentences
        :return: characters, connections
        '''
        title = chapter[0]
        paragraphs = chapter[1:]
        entities = [(self.ner_from_text(paragraph), paragraph) for paragraph in paragraphs]
        entities = [pair for pair in entities if len(pair[0]) != 0]

        connections = {}
        for pair in entities:
            entity = set(pair[0])
            if len(entity) <= 1:
                continue
            entity = list(entity)
            for ind in range(0, len(entity)):
                for other_ind in range(ind + 1, len(entity)):
                    a = entity[ind]
                    b = entity[other_ind]
                    if a not in connections:
                        connections[a] = {}
                    if b not in connections[a]:
                        connections[a][b] = 0
                    connections[a][b] += 1

                    if b not in connections:
                        connections[b] = {}
                    if a not in connections[b]:
                        connections[b][a] = 0
                    connections[b][a] += 1

        return connections

    def extract_sentiment_from_chapter(self, chapter):
        '''

        :param chapter: chapter waiting to be processed, a list of sentences
        :return: [(sentence,sentiment)]
        '''
        title = chapter[0]
        sentences = [sentence for paragraph in chapter[1:] for sentence in sent_tokenize(paragraph)]
        sentiments = [(sentence, self.sentiment_analysis_of_sentence(sentence)) for sentence in sentences]
        return sentiments

    def extract_location_from_chapter(self, chapter):
        '''

        :param chapter: chapter to be analyzed
        :return: location_conns: connections between locations
        '''
        title = chapter[0]
        paragraphs = chapter[1:]
        entities = [(self.extract_location_from_text(paragraph), paragraph) for paragraph in paragraphs]
        entities = [pair for pair in entities if len(pair[0]) != 0]

        connections = {}
        for pair in entities:
            entity = set(pair[0])
            if len(entity) <= 1:
                continue
            entity = list(entity)
            for ind in range(0, len(entity)):
                for other_ind in range(ind + 1, len(entity)):
                    a = entity[ind]
                    b = entity[other_ind]
                    if a not in connections:
                        connections[a] = {}
                    if b not in connections[a]:
                        connections[a][b] = 0
                    connections[a][b] += 1

                    if b not in connections:
                        connections[b] = {}
                    if a not in connections[b]:
                        connections[b][a] = 0
                    connections[b][a] += 1

        return connections

    def extract_location_with_list(self, chapter, location_set):

        title = chapter[0]
        paragraphs = chapter[1:]
        entities = [([entity for entity in location_set if entity in paragraph], paragraph) for paragraph in paragraphs]
        entities = [pair for pair in entities if len(pair[0]) != 0]

        connections = {}
        for pair in entities:
            entity = set(pair[0])
            if len(entity) <= 1:
                continue
            entity = list(entity)
            for ind in range(0, len(entity)):
                for other_ind in range(ind + 1, len(entity)):
                    a = entity[ind]
                    b = entity[other_ind]
                    if a not in connections:
                        connections[a] = {}
                    if b not in connections[a]:
                        connections[a][b] = 0
                    connections[a][b] += 1

                    if b not in connections:
                        connections[b] = {}
                    if a not in connections[b]:
                        connections[b][a] = 0
                    connections[b][a] += 1

        return connections

    def cohesiveness_between_chapters(self, document):
        '''
        Compute cohesiveness between chapters using latent semantic analysis
        :param document: document to be processed, a list of chapters.
        :return: cohesivess matrix
        '''
        document = [' '.join(chapter) for chapter in document]

        document = [remove_stopwords(chapter).split() for chapter in document]
        dictionary = corpora.Dictionary(document)

        corpus = [dictionary.doc2bow(chapter) for chapter in document]

        tfidf = models.TfidfModel(corpus)
        corpus_tfidf = tfidf[corpus]

        lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=2)
        corpus_lsi = lsi[corpus_tfidf]

        index = similarities.MatrixSimilarity(corpus_lsi)
        sims = index[corpus_lsi]
        # index = similarities.MatrixSimilarity(corpus_tfidf)// Similarity with tf-idf
        # sims = index[corpus_tfidf]
        #print(index)
        #print(sims)
        return sims



    def ner_from_text(self, text):
        '''

        :param sentence: sentence waiting to be processed, a list of tokens
        :return: entities in a sentence
        '''

        stop_words = set(stopwords.words('english'))
        text = text.replace("'", " ")
        text = word_tokenize(text)

        text = [word for word in text if word not in stop_words and word not in string.punctuation]
        text = ' '.join(text)

        entities = [ent.text for ent in self.nlp(text).ents if ent.label_ == 'PERSON']
        return entities

    def extract_location_from_text(self, text):
        '''

        :param sentence: sentence waiting to be processed, a list of tokens
        :return: entities in a sentence
        '''

        # stop_words = set(stopwords.words('english'))
        # text = text.replace("'", " ")
        # text = word_tokenize(text)
        #
        # text = [word for word in text if word not in stop_words]
        # text = ' '.join(text)

        entities = [ent.text for ent in self.nlp(text).ents if ent.label_ in ['GPE', 'LOC']]
        print(entities, text)
        return entities

    def sentiment_analysis_of_sentence(self, sentence):
        '''

        :param sentence: sentence waiting to be processed, a list of tokens
        :return: sentiment polarity
        '''
        return self.text_blob(sentence).sentiment


if __name__ == "__main__":
    text = DocIOHelper.read_doc_n_prep("../Data/Burrow.txt")
    chaps = DocIOHelper.split_chapters(text, "CHAPTER")
    docAnalyzer = DocAnalyzer()
    # sentiment_sentence = docAnalyzer.extract_sentiment_from_chapter(chaps[0])
    # for i in sentiment_sentence:
    #     print(i)
    # conns = docAnalyzer.extract_conns_from_chapter(chaps[0])
    # print(conns)
    docAnalyzer.cohesiveness_between_chapters(chaps)
