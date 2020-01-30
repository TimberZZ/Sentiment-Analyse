


class DocIOHelper:
    @staticmethod
    def read_doc_n_prep(path):
        '''
        Read in a document and preprocess.
        :param path: document path.
        :return: document consists of chapters.
        '''
        with open(path) as file:
            lines = file.readlines()
            lines = [line.strip() for line in lines]  # Strip whitespace at both sides of each sentence.
            lines = [line for line in lines if len(line) >= 2]  # Filter out too short sentences.
            return lines

    @staticmethod
    def split_chapters(document, split_line="CHAPTER"):
        '''
        Split a whole text into chapters, which is splited by lines starting with split_line.
        :param document: document to be processed.
        :param split_line: starting part of lines which splits chapters in document.
        :return: a list of chapters
        '''
        chapters = []
        chapter_indexes = [i for i in range(0, len(document)) if (document[i].strip().startswith(split_line))]
        chapter_indexes.append(len(document))
        for ind in range(0, len(chapter_indexes) - 1):
            chapters.append(document[chapter_indexes[ind]:chapter_indexes[ind + 1]])
        return chapters


if __name__ == "__main__":
    text = DocIOHelper.read_doc_n_prep("../Data/Burrow.txt")
    chaps = DocIOHelper.split_chapters(text, "CHAPTER")
    print(len(chaps))
    for chapter in chaps:
        print(chapter)
